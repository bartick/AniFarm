import { sqldb } from '../utils';
import { Card, LocationFloor, Exerience } from '../interfaces';

async function cardPromise(name: string): Promise<Card> {
    return new Promise((resolve, reject) => {
        const rows: Array<Card> = sqldb.prepare("SELECT * FROM cards WHERE NAME LIKE ?").all("%" + name + "%")
        for (let i = 0; i < rows.length; i++) {
            let row: Card = rows[i];
            if ((row.NAME.toLowerCase() === name.toLowerCase()) || (row.NAME.toLowerCase().split(/[\s\(\)]+/).indexOf(name.toLowerCase()) >= 0)) {
                resolve(row);
            };
        };
        reject(new Error('I was unable to find the card you are looking for please try with a proper spelling.\nIf you think this is a mistake then please contact the developer'));
    });
}

async function locfl (series: string): Promise<LocationFloor> {
    return sqldb.prepare('SELECT * FROM location WHERE SERIES=?').get(series);
}

async function expcalculator(exp: Array<number>): Promise<Array<Exerience>> {
    return sqldb.prepare('SELECT Exp FROM Expcards WHERE Level Between ? AND ?').all(exp[0], exp[1]);
}

export { 
    cardPromise,
    locfl,
    expcalculator
 };