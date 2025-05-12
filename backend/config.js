/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

export default {
	'apiUrl': 'http://sso:28080/realms/master/protocol/openid-connect/userinfo',
	'keycloakTokenUrl': 'http://sso:28080/realms/master/protocol/openid-connect/token',
    'keycloakAuthorizationServerUrl': 'http://sso:28080/realms/master/protocol/openid-connect/auth',
    'keycloakClientId': 'liferay-pif-sample-cx',
    'keycloakClientSecret': 'XhBebyJPZJODCWcSkPCBdQ014cYivMPv',
	'redirectUri': 'http://localhost:3001/oauth2/callback',
	'com.liferay.lxc.dxp.domains': 'localhost:8080',
	'com.liferay.lxc.dxp.mainDomain': 'localhost:8080',
	'com.liferay.lxc.dxp.server.protocol': 'http',    
	'configTreePaths': [
		process.env.LIFERAY_ROUTES_CLIENT_EXTENSION,
		process.env.LIFERAY_ROUTES_DXP,
	],
	'liferay.oauth.application.external.reference.codes':
		'tracking-management-node-oauth-application-headless-server',
    'liferay.oauth.application.client.id':
		'id-d042114b-41f4-8bfc-b463-639ba14cc29',
    'liferay.oauth.application.client.secret':
		'secret-e98fae7f-d6da-9dcb-d1e9-70ba4b5c7fb1',
	'readyPath': '/ready',
	'server.port': 3001,
};