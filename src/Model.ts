export interface Producto {
    IdProducto?: number,
    Nombre: string,
    Categoria?: string,
    IdMarca: number,
    Imagen?: string,
    Tiendas?: string[],
    PrecioPromedio: number,
}

export interface Marca {
    IdMarca?: number,
    Nombre: string,
    Correo: string,
    Telefono: string,
    PaginaWeb: string
}