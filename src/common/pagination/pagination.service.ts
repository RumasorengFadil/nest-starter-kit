import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginateOptions, PaginatedResult } from './pagination.interface';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: PaginateOptions = {},
    queryBuilderCallback?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  ): Promise<PaginatedResult<T>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;

    let qb = repository.createQueryBuilder('entity');

    // Apply custom query if provided
    if (queryBuilderCallback) {
      qb = queryBuilderCallback(qb);
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        perPage: limit,
        currentPage: page,
        lastPage,
      },
    };
  }
}
