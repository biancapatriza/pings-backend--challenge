module.exports = [
    {
        env: 'dev',
        name: 'Development',
        connections: [
            {
                id: 'default',
                host: 'localhost',
                port: '3306',
                user: 'root',
                pass: '',
                name: 'challengedb'
            }
        ]
    }
];