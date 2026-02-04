/**
 * Utilitários de Validação e Sanitização
 */

export const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

    let cpfArray = cpf.split('').map(el => +el);
    const rest = (count) => (cpfArray.slice(0, count).reduce((soma, el, index) => soma + el * (count + 1 - index), 0) * 10) % 11 % 10;

    return rest(9) === cpfArray[9] && rest(10) === cpfArray[10];
};

export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
    // Valida formatos (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    phone = phone.replace(/\D/g, '');
    return phone.length === 10 || phone.length === 11;
};

export const validatePassword = (password) => {
    // Mínimo 8 caracteres, pelo menos uma letra e um número
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
};

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};
