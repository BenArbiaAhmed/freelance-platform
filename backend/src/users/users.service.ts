import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { FreelanceProfile } from './entities/freelance-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(FreelanceProfile)
    private readonly freelanceProfileRepo: Repository<FreelanceProfile>,
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepo: Repository<ClientProfile>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.repo.save(this.repo.create(dto));

    if (user.role === UserRole.FREELANCE) {
      await this.freelanceProfileRepo.save(
        this.freelanceProfileRepo.create({ userId: user.id, user }),
      );
    } else if (user.role === UserRole.CLIENT) {
      await this.clientProfileRepo.save(
        this.clientProfileRepo.create({ userId: user.id, user }),
      );
    }

    return user;
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({
      where: { id },
      relations: { freelanceProfile: true, clientProfile: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  // motDePasse is `select: false`, so it must be requested explicitly. Used by
  // the auth layer to verify credentials at login.
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.motDePasse')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    // BeforeInsert only hashes on creation, so hash here when the password is
    // being changed via an update.
    if (dto.motDePasse) {
      user.motDePasse = await bcrypt.hash(dto.motDePasse, 10);
    }
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`User ${id} not found`);
  }
}
