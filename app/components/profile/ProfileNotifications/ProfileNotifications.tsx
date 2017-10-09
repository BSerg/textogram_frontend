import * as React from 'react';
import ItemList from '../ItemList/ItemList';

export function ProfileNotifications() {
    return <div>
        <ItemList search={false} />
    </div>;
}

export default ProfileNotifications;