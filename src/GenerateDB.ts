import { IDataBase, Instance } from "jsstore";

export const generateDatabase = (DbConnection: Instance, DbName: string) => {
    DbConnection.isDbExist(DbName).then(function (isExist) {
        if (isExist) {
            console.log("Base de datos existente");
            DbConnection.dropDb();
        }
        console.log("Base de datos creada");
        var DataBase = getDatabase();
        DbConnection.createDb(DataBase);
        insertarMarcas(DbConnection);
        console.log("Marcas Insertadas");
        insertarProductos(DbConnection);
        console.log("Productos Insertados");
    });
}

function getDatabase() : IDataBase {
    //Definir Atributos de Tablas
    var tabla_marca = {
        name: "Marca",
        columns: [{
            name: "ID_Marca",
            primaryKey: true,
            dataType: "number",
            autoIncrement: true,
        },
        {
            name: "Nombre",
            notNull: true,
            dataType: "string"
        },
        {
            name: "Correo",
            notNull: true,
            dataType: "string",
            default: "N/A"
        },
        {
            name: "Telefono",
            notNull: true,
            dataType: "string",
            default: "N/A"
        },
        {
            name: "Pagina_Web",
            notNull: true,
            dataType: "string",
            default: "N/A"
        }
        ]
    }

    var tabla_producto = {
        name: "Producto",
        columns: [{
            name: "ID_Producto",
            primaryKey: true,
            dataType: "number",
            autoIncrement: true,
        },
        {
            name: "Nombre",
            notNull: true,
            dataType: "string"
        },
        {
            name: "Categoria",
            dataType: "string",
            default: "N/A"
        },
        {
            name: "Marca",
            notNull: true,
            dataType: "string"
        },
        {
            name: "Imagen",
            dataType: "string",
            default: "N/A"
        },
        {
            name: "Tiendas",
            multiEntry: true
        },
        {
            name: "Precio_Promedio",
            notNull: true,
            dataType: "number",
        }
        ]
    }

    //Insertar Tablas en BD
    var DataBase = {
        name: "Catalogo",
        tables: [tabla_marca, tabla_producto]
    }

    return DataBase;
}

//Generar valores iniciales
function generarMarcas() {
    var marcas = [
        {
            Nombre: "Unilever",
            Correo: "unilever@unilever.com",
            Telefono: "5541232121",
            PaginaWeb: "http://www.unilever.com"
        },
        {
            Nombre: "Lenovo",
            Correo: "lenovo@lenovo.com",
            Telefono: "",
            PaginaWeb: "http://www.lenovo.com"
        },
        {
            Nombre: "Pantene",
            Correo: "pantene@pantene.com",
            Telefono: "989798792",
            PaginaWeb: ""
        } 
    ];
    return marcas;
}

//Generar valores iniciales
function generarProductos() {
    var productos = [
        {
            Nombre: "Dove: Intense Moisture",
            Categoria: "Shampoo",
            IdMarca: 1,
            Imagen: "http://s4.reutersmedia.net/resources/r/?m=02&d=20090925&t=2&i=11724477&w=644&fh=&fw=&ll=&pl=&sq=&r=2009-09-25T132133Z_01_BTRE58O114100_RTROPTP_0_DOVE-INTENSE-MOISTURE-SHAMPOO-AND-CONDITIONER",
            Tiendas: ["Wal-Mart", "Sam's Club"],
            PrecioPromedio: 25.50
        }, 
        {
            Nombre: "Pantene Moisture Renewal",
            Categoria: "Shampoo",
            IdMarca: 3,
            Imagen: "https://d3lfzbr90tctqz.cloudfront.net/epi/resource/r/shampoo-pantene-pro-v-brillo-extremo-400-ml/0cc8b17df720da62ca4dd25d442ac01c34b403310087c6c07247b8da31735820_100",
            Tiendas: ["Farmacia del Ahorro"],
            PrecioPromedio: 30.0
        },
        {
            Nombre: "Pantene Pro-V",
            Categoria: "Shampoo",
            IdMarca: 3,
            Imagen: "https://images-na.ssl-images-amazon.com/images/I/715cty2DbkL._SY355_.jpg",
            Tiendas: [],
            PrecioPromedio: 67.0
        }
    ];
    return productos;
}

//Insertar valores en la BD
export function insertarMarcas(DbConnection: Instance) {
    var marcas = generarMarcas();
    DbConnection.insert({
        into: "Marcas",
        values: marcas
    }).catch(function (err) {
        console.log(err);
        alert("Ocurrió un error al generar las marcas");
    });
}

//Insertar valores en la BD
export function insertarProductos(DbConnection: Instance) {
    var productos = generarProductos();
    DbConnection.insert({
        into: "Productos",
        values: productos
    }).catch(function (err) {
        console.log(err);
        alert("Ocurrió un error al generar las marcas");
    })
}