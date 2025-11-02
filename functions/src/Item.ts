export interface Item {
    id: string;
    strNombre: string;
    strTipoPlaya: string;
    idDepartamento: string;
    idProvincia: string;
    idDistrito: string;
    strDireccion: string;
    strCalidadSanitaria: string;
    keyCalidadSanitaria: string;
    strDescripcion: string;
    dateUltimaInspeccion: string;
    strDepartamento: string;
    strProvincia: string;
    strDistrito: string;
    urlFoto: string;
    strSource: string;
    strUltimaInspeccion: string;
    strLatitud: string;
    strLongitud: string;
    aControles: Array<{
        control: string;
        valor: number;
    }>;
}

export interface ItemWithDistance extends Item {
    distance?: number;
    mapUrl?: string;
}
