import Action from '../Action';

export const RESET_FORMAT_TOOL = 'create_format_tool';

export const ContentEditableAction = new Action({formatTool: null});

export interface IFormatTool {
    onBold?: () => any;
    onItalic?: () => any;
    onURL?: (url: string) => any;
    onRemoveURL?: () => any;
    isBold?: boolean;
    isItalic?: boolean;
    isURL?: boolean;
    disableBold?: boolean;
    disableItalic?: boolean;
    disableURL?: boolean;
}

ContentEditableAction.register(RESET_FORMAT_TOOL, (store, data: IFormatTool | null) => {
    store.formatTool = data;
});


