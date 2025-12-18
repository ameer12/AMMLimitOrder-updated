const Pools = require("../db"); // path to db.js

const listPools = async () => {
    try {
        const result = await Pools.query("SELECT * FROM pools");
        return result.rows;
    } catch (err) {
        console.log(err);
        return [];
    }
};

const getOnePool = async (routerAddress, tokenA, tokenB) => {
    try {
        const query = `
            SELECT *
            FROM pools
            WHERE routerAddress = $1
              AND (
                    (token0Address = $2 AND token1Address = $3)
                 OR (token0Address = $3 AND token1Address = $2)
              )
            LIMIT 1;
        `;

        const result = await Pools.query(query, [routerAddress, tokenA, tokenB]);

        return result.rows[0] || null;
    } catch (err) {
        console.log(err);
        return null;
    }
};

const createPool = async (address, token1, token2, routerAddress) => {
    try {
        // upsert manually
        const query = `
            INSERT INTO pools (address, token0Address, token1Address, routerAddress)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (address)
            DO NOTHING;
        `;

        await Pools.query(query, [address, token1, token2, routerAddress]);

        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

module.exports = {
    listPools,
    getOnePool,
    createPool
};
