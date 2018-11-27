import { ITable, Column, COL_OPTION, DATA_TYPE } from 'jsstore';

export const MarcasTbl: ITable = {
    name: "Marcas",
    columns: [
        new Column('IdMarca').options([
            COL_OPTION.PrimaryKey,
            COL_OPTION.AutoIncrement
        ]).setDataType(DATA_TYPE.Number),
        
        new Column('Nombre').options([
            COL_OPTION.NotNull
        ]).setDataType(DATA_TYPE.String),
        
        new Column('Correo').options([
            COL_OPTION.NotNull
        ]).setDataType(DATA_TYPE.String)
        .setDefault("N/A"),
        
        new Column('Telefono').options([
            COL_OPTION.NotNull,
            
        ]).setDataType(DATA_TYPE.String)
        .setDefault("N/A"),
        
        new Column('PaginaWeb')
        .setDataType(DATA_TYPE.String)
        .setDefault("N/A")
    ]
};

export const ProductosTbl: ITable = {
    name: "Productos",
    columns: [
        new Column('IdProducto').options([
            COL_OPTION.PrimaryKey,
            COL_OPTION.AutoIncrement
        ]).setDataType(DATA_TYPE.Number),
        
        new Column('Nombre').options([
            COL_OPTION.NotNull
        ]).setDataType(DATA_TYPE.String),
        
        new Column('Categoria')
        .setDataType(DATA_TYPE.String)
        .setDefault("N/A"),
        
        new Column('IdMarca').options([
            COL_OPTION.NotNull,
        ]).setDataType(DATA_TYPE.Number),
        
        new Column('Imagen').options([
        ]).setDataType(DATA_TYPE.String),
        
        new Column('Tiendas').options([
            COL_OPTION.MultiEntry
        ]),
        
        new Column('PrecioPromedio').options([
            COL_OPTION.NotNull
        ]).setDataType(DATA_TYPE.Number)
    ]
};


