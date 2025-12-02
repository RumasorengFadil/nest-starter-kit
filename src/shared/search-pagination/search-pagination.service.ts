import { Injectable } from '@nestjs/common';
import { Repository, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import {
  SearchPaginateOptions,
  PaginatedResult,
} from './search-pagination.interface';

/**
 * Service to handle paginated search queries for any TypeORM repository.
 *
 * This service provides a generic `paginate` method that:
 * - Supports pagination (page & limit)
 * - Supports searching across multiple fields
 * - Allows custom query modifications via a callback
 *
 * Example usage:
 * const result = await searchPaginationService.paginate(courseRepository, {
 *   page: 2,
 *   limit: 10,
 *   q: 'keyword',
 *   searchFields: ['title', 'description'],
 * });
 *
 * @template T The entity type of the repository
 */
@Injectable()
export class SearchPaginationService {
  /**
   * Paginate and optionally search records in a repository.
   *
   * @param repository TypeORM repository for the entity
   * @param options Pagination and search options
   *   - page: Page number (default 1)
   *   - limit: Items per page (default 10)
   *   - q: Search keyword
   *   - searchFields: Fields to apply the search keyword
   * @param queryBuilderCallback Optional function to modify the query builder
   * @returns PaginatedResult<T> containing the data and pagination metadata
   */
  async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: SearchPaginateOptions = {},
    queryBuilderCallback?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  ): Promise<PaginatedResult<T>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;

    let qb = repository.createQueryBuilder('entity');

    // Apply search keyword on specified fields
    if (options.q && options.searchFields && options.searchFields.length > 0) {
      const searchQb = options.searchFields
        .map((field) => `entity.${field} LIKE :q`)
        .join(' OR ');

      qb.where(searchQb, { q: `%${options.q}%` });
    }

    // Apply any additional query modifications
    if (queryBuilderCallback) {
      qb = queryBuilderCallback(qb);
    }

    // Get paginated data and total count
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
