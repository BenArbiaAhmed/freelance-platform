import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  FreelanceProfileFilterInput,
  FreelanceProfileSortInput,
  MissionFilterInput,
  MissionSortInput,
  PaginatedFreelanceProfileResult,
  PaginatedMissionResult,
  PaginationInput,
} from './graphql.types';
import { SearchService } from './search.service';

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => PaginatedFreelanceProfileResult)
  searchFreelanceProfiles(
    @Args('filter', {
      type: () => FreelanceProfileFilterInput,
      nullable: true,
    })
    filter?: FreelanceProfileFilterInput,
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput,
    @Args('sort', {
      type: () => FreelanceProfileSortInput,
      nullable: true,
    })
    sort?: FreelanceProfileSortInput,
  ) {
    return this.searchService.searchFreelanceProfiles(filter, pagination, sort);
  }

  @Query(() => PaginatedMissionResult)
  searchMissions(
    @Args('filter', {
      type: () => MissionFilterInput,
      nullable: true,
    })
    filter?: MissionFilterInput,
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput,
    @Args('sort', {
      type: () => MissionSortInput,
      nullable: true,
    })
    sort?: MissionSortInput,
  ) {
    return this.searchService.searchMissions(filter, pagination, sort);
  }
}
