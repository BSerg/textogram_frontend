interface VKInitParams {
    apiId: string
}

interface VKAuth {
    login(callback: (response: any) => void, settings: number): void;
    logout(callback: (response: any) => void): void;
}


interface VKSDK {
    init(VKInitObject: VKInitParams): void;

    Auth: VKAuth;

    api(method: string, parameters: any, callback: (response: any) => void): void;


}

interface Window{
    vkAsyncInit() : any;
}

declare module "VK" {
    export = VK;
}



declare var VK : VKSDK;