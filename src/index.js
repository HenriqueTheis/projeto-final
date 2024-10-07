import express, { request, response } from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import {v4 as uuidv4} from 'uuid'
const app = express()
app.use(cors())
app.use(express.json())
app.listen(8000, () => {
    console.log(`porta rodando porta 8000`)
})

const users = []


app.post('/singup', async (request, response) => {
    try{
        const {email, senha} = request.body

        const senhaSecreta = await bcrypt.hash(senha,10)

        const exisingUser = users.find(user => user.email) === email
        
        if(exisingUser){
            return response.status(400).json({message: 'usuário ja existe'})
        }
        const novoUser = {
            id: uuidv4(),
           email: email,
           senha:senhaSecreta 
        }

        users.push(novoUser)
        return response.status(200).json("Cadastro realizado com sucesso");

    } catch (error) {
        response.status(500).json({message:'Erro ao cadastrar'})

    }
    
   
})

app.post('/login', async(request, response) => {

    try{
        const {email, senha} = request.body

    const admUser =users.find(user => user.email === email)
    if(!admUser){
        return response.status(404).json({message: 'Usuário não encontrado'})
    }
    
    const VerificarSenha = await bcrypt.compare(senha, admUser.senha)

    if(!VerificarSenha){
        return response.status(404).json({message: 'Senha Errada'})
    }

    return response.status(200).json({message: 'login feito com sucesso'})

    }catch(error){
        return response.status(500).json({message: 'Error ao logar'})
    }

})