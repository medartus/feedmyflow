import React from "react";
import { shallow, mount } from "enzyme";

import * as AuthContext from "../../provider/auth";
import authContext from "../../provider/auth";
import ProtectedRoute from "./protectedRoute";
import AuthChecker from "../authChecker/authChecker";
import { Route, Redirect, BrowserRouter } from "react-router-dom";


const MockComponent = () => { return(<p>test</p>) }

describe('Protected Route', () => {
  it("Should render AuthChecker", () => {

    jest.spyOn(AuthContext, "useAuth").mockImplementation(() => ({authStatus:{haveTriedLogin:false,isConnected:false,user:undefined}}));
  
    const wrapper = mount(
      <BrowserRouter initialEntries={['/test']}>
        <authContext.Provider>
          <ProtectedRoute exact path="/test" comp={MockComponent}/>
        </authContext.Provider>
      </BrowserRouter>
    );
    expect(wrapper.find('MockComponent')).toHaveLength(1);
    // expect(wrapper.text().includes('Redirect')).toBeFalsy();
    // expect(wrapper.text().includes('p')).toBeFalsy();
  });

  // it("Should render Redirect", () => {
  //   jest.spyOn(AuthContext, "useAuth").mockImplementation(() => ({authStatus:{haveTriedLogin:false,isConnected:false,user:undefined}}));
  
  //   const wrapper = mount(
  //     <BrowserRouter>
  //       <authContext.Provider>
  //         <ProtectedRoute exact path="/test" comp={MockComponent}/>
  //       </authContext.Provider>
  //     </BrowserRouter>
  //   );
  //   expect(wrapper.find('AuthChecker').exists()).toBe(false);
  //   expect(wrapper.find('AuthChecker')).toHaveLength(1);
  //   expect(wrapper.find('p').exists()).toBe(false);
  // });

  // it("Should render children Component", () => {
  //   jest.spyOn(AuthContext, "useAuth").mockImplementation(() => ({authStatus:{haveTriedLogin:true,isConnected:true,user:undefined}}));
  
  //   const wrapper = mount(
  //     <BrowserRouter>
  //       <Route render={MockComponent}/>
  //     </BrowserRouter>
  //   );
  //   console.log(wrapper.text())
  //   // expect(wrapper.find('AuthChecker').exists()).toBeFalsy();
  //   // expect(wrapper.find('Redirect').exists()).toBeFalsy();
  //   expect(wrapper.find('p')).toHaveLength(1);
  // });
})