const {
    validatePassword,
    validateEmail,
    hashPassword,
} = require('../../../modules/user/utils/userUtils');

describe('validatePassword()', () => {
    test('acepta contraseña válida con mayúscula, número y especial', () => {
        expect(validatePassword('TestPass1!')).toBe(true);
    });

    test('acepta contraseña de exactamente 8 caracteres válidos', () => {
        expect(validatePassword('Aa1!Bb2@')).toBe(true);
    });

    test('rechaza contraseña sin mayúscula', () => {
        expect(validatePassword('testpass1!')).toBe(false);
    });

    test('rechaza contraseña sin número', () => {
        expect(validatePassword('TestPass!!')).toBe(false);
    });

    test('rechaza contraseña de menos de 8 caracteres', () => {
        expect(validatePassword('Aa1!')).toBe(false);
    });

    test('rechaza contraseña vacía', () => {
        expect(validatePassword('')).toBe(false);
    });
});

describe('validateEmail()', () => {
    test('acepta email de Gmail válido', () => {
        expect(validateEmail('user@gmail.com')).toBe(true);
    });

    test('acepta email de Hotmail válido', () => {
        expect(validateEmail('user@hotmail.com')).toBe(true);
    });

    test('acepta email de UTP válido', () => {
        expect(validateEmail('user@utp.edu.co')).toBe(true);
    });

    test('rechaza email sin dominio', () => {
        expect(validateEmail('useremail')).toBe(false);
    });

    test('rechaza email con dominio no permitido', () => {
        expect(validateEmail('user@yahoo.com')).toBe(false);
    });

    test('rechaza string vacío', () => {
        expect(validateEmail('')).toBe(false);
    });
});

describe('hashPassword()', () => {
    test('retorna un string diferente al password original', async () => {
        const hash = await hashPassword('TestPass1!');
        expect(hash).not.toBe('TestPass1!');
    });

    test('el hash tiene el formato bcrypt ($2a$ o $2b$)', async () => {
        const hash = await hashPassword('TestPass1!');
        // bcryptjs puede generar $2a$ o $2b$ dependiendo de la versión
        expect(hash.startsWith('$2')).toBe(true);
    });

    test('dos hashes del mismo password son diferentes (salt aleatorio)', async () => {
        const hash1 = await hashPassword('TestPass1!');
        const hash2 = await hashPassword('TestPass1!');
        expect(hash1).not.toBe(hash2);
    });
});
