import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// Porta onde o servidor irá rodar
app.listen(8000, () => {
    console.log(`Servidor rodando na porta 8000`);
});

// Armazenamento de dados
const users = [];
const messages = [];

// Rota inicial
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem vindo à aplicação!' });
});

// Rota de Sign Up (Criar pessoa usuária)
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
        }

        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email já cadastrado, insira outro.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        return res.status(201).json({ message: `Seja bem-vindo(a) ${name}! Pessoa usuária registrada com sucesso!` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar a pessoa usuária.' });
    }
});

// Rota de Login (Acessar a pessoa usuária)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Insira um e-mail e uma senha válidos.' });
        }

        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(404).json({ message: 'Email não encontrado no sistema, verifique ou crie uma conta.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        return res.status(200).json({ message: `Seja bem-vindo(a) ${user.name}! Pessoa usuária logada com sucesso!` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao realizar o login.' });
    }
});

// Rota para Criar Mensagem (Create)
app.post('/message', (req, res) => {
    const { email, title, description } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Por favor, insira um e-mail.' });
    }
    if (!title || !description) {
        return res.status(400).json({ message: 'Por favor, insira um título e uma descrição.' });
    }

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(404).json({ message: 'Email não encontrado, verifique ou crie uma conta.' });
    }

    const newMessage = {
        id: uuidv4(),
        title,
        description,
        email
    };

    messages.push(newMessage);
    res.status(201).json({ message: 'Mensagem criada com sucesso!', newMessage });
});

// Rota para Ler Mensagens (Read)
app.get('/message/:email', (req, res) => {
    const { email } = req.params;

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(404).json({ message: 'Email não encontrado, verifique ou crie uma conta.' });
    }

    const userMessages = messages.filter(message => message.email === email);
    res.status(200).json({ message: 'Recados encontrados com sucesso!', userMessages });
});

// Rota para Atualizar Mensagem (Update)
app.put('/message/:id', (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const message = messages.find(message => message.id === id);
    if (!message) {
        return res.status(404).json({ message: 'Por favor, informe um id válido da mensagem.' });
    }

    if (title) message.title = title;
    if (description) message.description = description;

    res.status(200).json({ message: 'Mensagem atualizada com sucesso!', message });
});

// Rota para Deletar Mensagem (Delete)
app.delete('/message/:id', (req, res) => {
    const { id } = req.params;

    const messageIndex = messages.findIndex(message => message.id === id);
    if (messageIndex === -1) {
        return res.status(404).json({ message: 'Mensagem não encontrada, verifique o identificador em nosso banco.' });
    }

    messages.splice(messageIndex, 1);
    res.status(200).json({ message: 'Mensagem apagada com sucesso!' });
});
