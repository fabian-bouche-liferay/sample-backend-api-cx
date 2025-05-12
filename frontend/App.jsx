import React, { useEffect, useState } from 'react';
import { Provider } from '@clayui/core';
import '@clayui/css/lib/css/atlas.css';

function App(props) {
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('http://localhost:3001/foo', {
                    credentials: 'include'
                });

                if (res.status === 200) {
                    const data = await res.json();
                    setUserInfo(data);
                } else if (res.status === 401 || res.status === 403) {
                    const redirectUrl = encodeURIComponent(window.location.href);
                    window.location.href = `http://localhost:3001/oauth2/init?redirect=${redirectUrl}`;
                } else {
                    setError(`Unexpected response: ${res.status}`);
                }
            } catch (err) {
                setError(`Fetch error: ${err.message}`);
            }
        }

        fetchUser();
    }, []);

    return (
        <Provider spritemap={window.Liferay.Icons?.spritemap}>
            <h1>Hello world</h1>
            {userInfo ? (
                <pre>{JSON.stringify(userInfo, null, 2)}</pre>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <p>Loading user info...</p>
            )}
        </Provider>
    );
}

export default App;
