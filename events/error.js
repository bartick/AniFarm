module.exports = {
    name: 'error',
    async execute(error) {
        console.log(error.message);
    }
};