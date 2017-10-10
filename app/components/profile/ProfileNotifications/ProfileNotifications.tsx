import * as React from 'react';
import ItemList from '../ItemList/ItemList';
import ProfileNotification from './ProfileNotification';

export function ProfileNotifications() {
    return <div>
        <ItemList search={false} ItemComponent={ProfileNotification} />
    </div>;
}

export default ProfileNotifications;