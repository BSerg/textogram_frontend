import {BlockContentTypes, Embed} from "../../constants";

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

export let validateEmbed = (type: BlockContentTypes, value: string) => {
    let isValid = false, testRegexps, testCodeRegexps;
    switch (type) {
        case BlockContentTypes.VIDEO:
            testRegexps = Embed.urlRegex.VIDEO;
            testCodeRegexps = Embed.embedRegex.VIDEO;
            break;
        case BlockContentTypes.AUDIO:
            testRegexps = Embed.urlRegex.AUDIO;
            testCodeRegexps = Embed.embedRegex.AUDIO;
            break;
        case BlockContentTypes.POST:
            testRegexps = Embed.urlRegex.POST;
            testCodeRegexps = Embed.embedRegex.POST;
            break;
    }
    if (testRegexps) {
        Object.values(testRegexps).forEach((regex) => {
            if (regex.test(value)) {
                isValid = true;
            }
        });
    }
    if (testCodeRegexps) {
        Object.values(testCodeRegexps).forEach((regex) => {
            if (regex.test(value)) {
                isValid = true;
            }
        });
    }
    return isValid;
};