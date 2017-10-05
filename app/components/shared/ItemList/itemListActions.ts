import {ACTIONS} from '../../../store/constants';



export function setSearchString(s: string) {
    return {type: ACTIONS.ITEM_LIST_SET_SEARCH_STRING, searchString: s};
}

export function setSection(section: any) {
    return (dispatch: any, getState: any)  => {
        let currentSection = getState().itemList.section;
        if (currentSection === section) {
            return;
        }
        dispatch({type: ACTIONS.ITEM_LIST_SET_SECTION, section});

        dispatch(getItems());
    }
}

export function getItems() {
    return (dispatch: any, getState: any) => {
        let author = getState().authorData.author;
        console.log(author);
    }
}