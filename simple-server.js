const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Helper functions
const readUsers = () => {
    try {
        const data = fs.readFileSync('users.json');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
};

const writeUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static(__dirname));

// Authentication endpoints
app.post('/api/register', (req, res) => {
    const { email, password, fullName } = req.body;
    const users = readUsers();
    
    if (users.users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = hashPassword(password);
    users.users.push({ email, password: hashedPassword, fullName });
    writeUsers(users);
    res.json({ message: 'Registration successful' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    const hashedPassword = hashPassword(password);
    const user = users.users.find(u => u.email === email && u.password === hashedPassword);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken();
    user.token = token;
    writeUsers(users);
    
    res.json({
        token: token,
        user: { email: user.email, fullName: user.fullName }
    });
});


// Serve specific HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
 
