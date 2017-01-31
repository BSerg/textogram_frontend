export class Validator {
    static isValid(content: any, validationConfig: any): boolean {
        let valid = true;
        for (let field in validationConfig){
            if (validationConfig[field].isRequired && !content[field]) {
                valid = false;
            }
            if (validationConfig[field].maxLength && content[field].length > validationConfig[field].maxLength) {
                valid = false;
            }
        }
        return valid;
    }
    static validate(content: any, validationConfig: any): {isValid: boolean, messages: any} {
        let valid = true;
        let messages = {} as any;
        for (let field in validationConfig){
            if (validationConfig[field].isRequired && !content[field]) {
                valid = false;
                messages[field] = validationConfig[field].message;
            }
            if (validationConfig[field].maxLength && content[field].length > validationConfig[field].maxLength) {
                valid = false;
                messages[field] = validationConfig[field].message;
            }
        }
        return {isValid: valid, messages: messages};

    }
}