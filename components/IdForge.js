/**
 * Generate a unique alphanumeric id which will be sortable by date to the millisecond.
 * This is used in place of mongo's ObjectId in most circumstances.
 */
class IdForge {
    static datedId(randomCharacters=8) {
        let id = Number(Date.now()).toString(36);
        id += this.randomId(randomCharacters);
        return id;
    }
    static randomId(randomCharacters) {
        let id = "";
        for (let i=0;i<randomCharacters;i++) id += Number(Math.round(Math.random()*35)).toString(36);
        return id;
    }
}
module.exports = IdForge;
