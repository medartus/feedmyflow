/* eslint-disable promise/no-nesting */
const  {LinkedinPost} = require("../index");


const { expect, assert }  = require('chai');

// const wrapped = test.wrap(functions.sendWelcomeEmail);

// const data = test.auth.makeUserRecord({ 
//     email: 'marcetienne.dartus@gmail.com',
//     emailVerified: true,
//     displayName: "test user",
//     metadata:{
//             creationTime: '2018-03-13T01:24:48Z',
//             lastSignInTime: '2018-04-03T03:52:48Z'
//     },
//     uid: 'SQol8dFfyMapsQtRD4JgZdC5r1G2' 
// })
// // Invoke the wrapped function without specifying the event context.

// const wrapped = test.wrap(mailProvider.getEmailTemplate("welcome",{displayName:"Test user"}));
// wrapped(data);

// test.cleanup();

const snap = test.firestore.makeDocumentSnapshot({foo: 'bar'}, 'user/testUid/post');
// Call wrapped function with the snapshot
const wrapped = test.wrap(LinkedinPost);

describe('mailProvider',()=>{
    
    it('Should throw an error if no parameters', () => {
        return wrapped(snap).then(() => {
        return admin.database().ref('messages/11111/uppercase').once('value').then((createdSnap) => {
          // Assert that the value is the uppercased version of our input.
          assert.equal(createdSnap.val(), 'INPUT');
          return;
        })
      });
    })
});