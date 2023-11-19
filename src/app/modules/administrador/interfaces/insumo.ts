export interface insumoResponse {
  mensaje: string;
  object:  insumo[];
}

export interface insumo {
  id:       number;
  nombre:   string;
  cantidad: number;
}

// interfaces paginacion insumos
export interface InsumoPaginacion {
  content:          insumo[];
  pageable:         Pageable;
  last:             boolean;
  totalPages:       number;
  totalElements:    number;
  size:             number;
  number:           number;
  sort:             Sort;
  numberOfElements: number;
  first:            boolean;
  empty:            boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize:   number;
  sort:       Sort;
  offset:     number;
  paged:      boolean;
  unpaged:    boolean;
}

export interface Sort {
  empty:    boolean;
  sorted:   boolean;
  unsorted: boolean;
}
