/* eslint-disable react/prop-types */

import FacebookLogin from 'react-facebook-login';

const LoginForm = (props) => {

  return (
    <FacebookLogin 
      buttonStyle={{padding:"6px"}}  
      appId="4087907114572119"  // we need to get this from facebook developer console by setting the app.
      autoLoad={false}  
      fields="name,email,picture"
      scope='public_profile,email,pages_show_list,pages_messaging,business_management'
      callback={props.handleFacebookCallback}/>
  );
};
export default LoginForm;