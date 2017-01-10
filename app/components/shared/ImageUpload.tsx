import * as React from 'react';


export default class ImageUpload extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="upload_image">
                <input ref="input" type="file"/>
            </div>
        )
    }
}