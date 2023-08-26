export interface Pagination {
    limit:  number;
    offset: number;
}

export interface ResponsePagination {
    page:       number,
    totalItems: number,
    perPage:    number,
    totalPages: number,
    prevPage:   number | null,
    nextPage:   number | null;
}