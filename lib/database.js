"use strict";

const environments = require('../config/env');
const mysql = require('mysql');
const res = require('./response');

const Mysql = {
    environments : environments,
    state : {
        pools : []
    },
    connect : (env = 'dev', dbname = '') => {
        Mysql.environments.forEach(elem => {
            elem.connections.forEach(conn => {
                let pool = mysql.createPool({
                    connectionLimit: 100, //important
                    host: conn.host,
                    user: conn.user,
                    password: conn.pass,
                    database: conn.name,
                    port: conn.port
                }); 
                Mysql.state.pools.push({
                    id: conn.id,
                    env: elem.env,
                    pool :  pool
                });                       
            });
        });

        let conns = [];
        Mysql.environments.forEach(env=>{
            env.connections.forEach(con => {
                let conn = Mysql.execute("SELECT version() ", [], env.env, con.id);
                conns.push(conn);
            });
        });

        return new Promise((resolve, reject)=>{
            Promise.all(conns).then(data=>{
                resolve(data);
            }).catch(error=>{
                reject(error);
            });
        });
    },
    get: (env = 'dev', id = 'default') =>{
        let state = Mysql.state.pools.find(elem=>{
            return elem.id.toLowerCase() == id.toLowerCase() && elem.env.toLowerCase() == env.toLowerCase();
        });
        return state.pool;
    },
    execute: (sql, param, env = 'dev', id = 'default') =>{
        let state = Mysql.state.pools.find(elem=>{
            return elem.id.toLowerCase() == id.toLowerCase() && elem.env.toLowerCase() == env.toLowerCase();
        });
        return new Promise((resolve, reject) => {
            state.pool.getConnection(function(error, connection) {
                if (error) {
                    reject(res.Error(error, `There is error connecting to in the database with ID : ${id} and ENV : ${env}`, 500));
                }else{
                    connection.query(sql, param, function (err, rows) {
                        connection.release();
                        if (!err) {
                            resolve(res.Success(rows, `Success connecting with ID : ${id} and ENV : ${env}`, 200));
                        }
                        else {
                            reject(res.Error(err, `There is error in querying in the database with ID : ${id} and ENV : ${env}`, 500));
                        }
                    });
            
                    connection.on('error', function (err) {
                        connection.release();
                        reject(res.Error(err, `There is error in connecting in the database pool with ID : ${id} and ENV : ${env}`, 500));
                    });   
                }
            });
        });
    }
};

exports.execute = Mysql.execute;
exports.get = Mysql.get;
exports.connect = Mysql.connect;
exports.environments = Mysql.environments;