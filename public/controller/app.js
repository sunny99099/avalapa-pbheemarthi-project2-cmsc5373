import {HomeView} from '../view/HomeView.js';
import {ProfileView} from '../view/ProfileView.js';
import {HomeController} from './HomeController.js';
import {ProfileController} from './ProfileController.js';
import {Router} from './Router.js';
import {loginFirebase,logoutFirebase,createAccount} from './firebase_auth.js';
import {startspinner,stopspinner} from '../view/util.js';


document.getElementById('appHeader').textContent="My Inventory Manager";
document.title="Inventory Manager";

const routes = [
    {path: '/', view: HomeView, controller: HomeController},
    {path: '/profile', view: ProfileView, controller: ProfileController}
];

export const router = new Router(routes);

router.navigate(window.location.pathname);

const menuItems = document.querySelectorAll('a[data-path]');
menuItems.forEach(item => {
    item.onclick = function(e){
        const path = item.getAttribute('data-path');
        router.navigate(path);
    }
});

document.forms.loginForm.onsubmit = async function(e){
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    startspinner();
    try{
        await loginFirebase(email, password);
        stopspinner();
        console.log('user logged in', email);
    } catch(e){
        stopspinner();
        console.error('Error logging in', e);
        const errorCode = e.code;
        const errorMessage = e.message;
        alert('Sign in failed:' + errorCode + ','+ errorMessage);
    }
    
}

document.getElementById('logoutButton').onclick = async function(e){
    startspinner();
    try{
        await logoutFirebase();
        stopspinner();
        console.log('user logged out');
    } catch(e){
        // stopspinner();
        console.error('Error logging out', e);
        const errorCode = e.code;
        const errorMessage = e.message;
        alert('Sign out failed:' + errorCode + ','+ errorMessage);
    }
}

document.forms.CreateAccountForm.onsubmit = async function(e){
    e.preventDefault();
    const email = e.target.email.value;
    const emailConform = e.target.emailConform.value;
    if(email !== emailConform){
        alert('Emails do not match');
        return;
    }
    const password = e.target.password.value;
    // startspinner();
    try{
        await createAccount(email, password);
        stopspinner();
        document.getElementById('CreateAccountDiv').classList.replace('d-block','d-none');
    } catch(e){
        stopspinner();
        console.error('Error creating user', e);
        const errorCode = e.code;
        const errorMessage = e.message;
        alert('Create account failed:' + errorCode + ','+ errorMessage);
    }
}

document.getElementById('gotoCreateAccount').onclick = function(e){
    document.getElementById('loginDiv').classList.replace('d-block','d-none');
    document.getElementById('CreateAccountDiv').classList.replace('d-none','d-block');
}

document.getElementById('gotoLogin').onclick = function(e){
    document.getElementById('CreateAccountDiv').classList.replace('d-block','d-none');
    document.getElementById('loginDiv').classList.replace('d-none','d-block');
}