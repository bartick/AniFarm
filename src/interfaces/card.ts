interface Card extends JSON {
    NAME: string;
    SERIES: string;
    TYPE: string;
    PICTURE: string;
    HP: number;
    ATK: number;
    DEF: number;
    SPEED: number;
    LOCATION: number;
    FLOOR: number;
    BASETALENT: string;
    SRTALENT: string;
    URTALENT: string;
    EMOJI: string;
    FOOTER: string;
    ID: number;
}

interface LocationFloor extends JSON {
    NAME: string;
    SERIES: string;
    PLACE: number;
    FLOORS: number;
}

export { Card, LocationFloor };