import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(dto: CreateUserDto): Promise<User> {
    return this.repo.save(this.repo.create(dto));
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
