import * as React from "react";
import Action from "../Action";

export const UPDATE_TOOLS = 'update_tools';

export const DesktopBlockToolsAction = new Action();

DesktopBlockToolsAction.register(UPDATE_TOOLS, (store, data: {position: number, tools: any[]}) => {
    Object.assign(store, data);
    console.log(store);
});

