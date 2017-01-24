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
}