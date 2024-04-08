const express = require('express');
const app = express();
app.use(express.json());

const fs = require('fs');
const path = require('path');
const joi = require('joi');
const userSchema = joi.object({
    firstName: joi.string().min(2).required(),
    secondName: joi.string().min(5).required(),
    age: joi.number().min(0).required(),
    city: joi.string().min(3)
})

const userDBPath = path.join(__dirname, 'users.json');

//Получение всех пользователей
app.get('/users', (req, res) => {
    const users = JSON.parse(fs.readFileSync(userDBPath));
    res.send({users});
});

// Получение пользователя по id
app.get('/users/:id', (req, res) => {
    const users = JSON.parse(fs.readFileSync(userDBPath));
    const user = users.find((user) => user.id === Number(req.params.id));

    if (user) {
        res.send({user})
    } else {
        res.status(404);
        res.send({user: null});
    }
});

//Добавление пользователя
app.post('/users', (req, res) => {
    const resultValidation = userSchema.validate(req.body);

    if (resultValidation.error) {
        return res.status(404).send({error: resultValidation.error.details});
    }

    const users = JSON.parse(fs.readFileSync(userDBPath));
    const arrayId = users.map(user => {
        return user.id;
    });
    let uniqId = Math.max(...arrayId);
    uniqId += 1;
    users.push({
        id: uniqId,
        ...req.body
    });
    fs.writeFileSync(userDBPath, JSON.stringify(users));
    res.send({id: uniqId});
});

//Редоктирование пользователя по id
app.put('/users/:id', (req, res) => {
    const resultValidation = userSchema.validate(req.body);

    if (resultValidation.error) {
        return res.status(404).send({error: resultValidation.error.details});
    }

    const users = JSON.parse(fs.readFileSync(userDBPath));
    const user = users.find((user) => user.id === Number(req.params.id));

    if (user) {
        user.firstName = req.body.firstName;
        user.secondName = req.body.secondName;
        user.age = req.body.age;
        user.city = req.body.city;
        fs.writeFileSync(userDBPath, JSON.stringify(users));
        res.send({user})
    } else {
        res.status(404);
        res.send({user: null});
    }
});

//удаление пользователя по id
app.delete('/users/:id', (req, res) => {
    const users = JSON.parse(fs.readFileSync(userDBPath));
    const user = users.find((user) => {
        return user.id === Number(req.params.id)});

    if (user) {
        const userIndex = users.indexOf(user);
        users.splice(userIndex, 1);
        fs.writeFileSync(userDBPath, JSON.stringify(users));
        res.send({id: req.params.id})
    } else {
        res.status(404);
        res.send({user: null});
    }
})

//Обработка несуществующих роутеров

app.use((req, res) => {
    res.status(404).send({message: 'URL not found!'})
});

app.listen(3000);
