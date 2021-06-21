import cloudbase from '../common/cloudbase'
import { useState, useEffect } from 'react'
import { AUTHSTATE } from '../common/auth-type'
import {
    onAuthUIStateChange,
} from '../common/helper';


export class AuthHooks {
    private app: cloudbase.app.App
    constructor(app: cloudbase.app.App) {
        this.app = app
    }

    useAuthData() {
        const [authState, setAuthState] = useState(AUTHSTATE.SIGNIN);
        const [user, setUser] = useState({});

        useEffect(() => {
            return onAuthUIStateChange(this.app, (nextAuthState, authData) => {
                setAuthState(nextAuthState);
                setUser(authData);
            });
        }, []);

        return {
            authState,
            user
        }
    }
}

export function createAuthHooks(app: cloudbase.app.App) {
    const hooks = new AuthHooks(app)
    return {
        useAuthData: hooks.useAuthData.bind(hooks),
    }
}