import faker from 'faker';

export const generatePost = () => {
    return {
        id: faker.random.uuid(),
        title: faker.name.title()
    }
};

export const generateComment = () => {
    return {
        id: faker.random.uuid(),
        body: faker.lorem.text(),
        title: faker.name.title(),
        rate: faker.random.number({min: 0, max: 10})
    };
};

export const generateProfile = () => {
    return {
        id: faker.random.uuid(),
        name: faker.name.firstName(),
        surname: faker.name.lastName()
    }
};

export const generateRole = () => {
    return {
        id: faker.random.uuid(),
        name: faker.random.arrayElement(['admin', 'moderator']),
    }
};

export const generateUser = () => {
    return {
        id: faker.random.uuid(),
        email: faker.internet.email(),
        passwordHash: faker.random.uuid(),
    };
};