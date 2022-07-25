require('dotenv').config()

const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken')
const app = require('./app')
const port = 3000
require('./database')
require('./redis/blocklist-access-token')
require('./redis/allowlist-refresh-token')

app.use((requisicao, resposta, proximo) => {
    resposta.set({
        'Content-Type': 'application/json'
    })

    proximo()
})

const routes = require('./rotas')
const { InvalidArgumentError, NaoEncontrado, NaoAutorizado } = require('./src/erros')
routes(app)

app.use((erro, requisicao, resposta, proximo) => {
    let status = 500
    const corpo = {
        mensagem: erro.message
    }

    if (erro instanceof NaoEncontrado) {
        status = 404
    }

    if (erro instanceof NaoAutorizado) {
        status = 401
    }

    if (erro instanceof InvalidArgumentError) {
        status = 400
    }

    if (erro instanceof JsonWebTokenError) {
        status = 401
    }

    if (erro instanceof TokenExpiredError) {
        status = 401
        corpo.expiradoEm = erro.expiredAt
    }

    resposta.status(status)
    resposta.json(corpo)
})

app.listen(port, () => console.log('A API está funcionando!'))
