const fs = require("fs");
const { expect, assert }  = require('chai');
const MailProvider = require('../src/mailProvider');

const mailProvider = new MailProvider()
describe('mailProvider',()=>{
    describe('sendWelcomeEmail',()=>{
        it('Should throw an error if no parameters', () => {
            expect(() => mailProvider.getEmailTemplate()).to.throw();
        });
        
        it('Should throw an error if use a wrong template name', () => {
            expect(() => mailProvider.getEmailTemplate('test')).to.throw();
        });

                
        it('Should have a string as a result', () => {
            const result = mailProvider.getEmailTemplate('welcome',{displayName:"test_user_name"});
            assert.typeOf(result, 'string');
        });
    
        
        it('Should have the same result as the moock for welcome', () => {
            const result = mailProvider.getEmailTemplate('welcome',{displayName:"test_user_name"});
            const html = fs.readFileSync('./test/moock/welcome.html','utf8');
            expect(result).to.be.equal(html);
        });
    
        it('Should have the same result as the moock for postConfirmation', () => {
            const result = mailProvider.getEmailTemplate('postConfirmation',{displayName:"test_user_name",photoURL:"http://url.com",shareCommentary:"foo: bar"});
            const html = fs.readFileSync('./test/moock/postConfirmation.html','utf8');
            expect(result).to.be.equal(html);
        });
    });

    describe('createMailOptions',()=>{
        it('Should throw an error if no parameters', () => {
            expect(() => mailProvider.createMailOptions()).to.throw();
        });
        
        it('Should throw an error if use a wrong template name', () => {
            expect(() => mailProvider.createMailOptions('test')).to.throw();
        });
        
        it('Should have an object as a result', () => {
            const result = mailProvider.createMailOptions('welcome',{displayName:"test_user_name"});
            assert.typeOf(result, 'object');
        });

        // it('Should have the same result as the moock for welcome', () => {
        //     const result = mailProvider.getEmailTemplate('welcome',{displayName:"test_user_name"});
        //     const html = fs.readFileSync('./test/moock/welcome.html','utf8');
        //     expect(result).to.be.equal(html);
        // });
    
        // it('Should have the same result as the moock for postConfirmation', () => {
        //     const result = mailProvider.getEmailTemplate('postConfirmation',{displayName:"test_user_name",photoURL:"http://url.com",shareCommentary:"foo: bar"});
        //     const html = fs.readFileSync('./test/moock/postConfirmation.html','utf8');
        //     expect(result).to.be.equal(html);
        // });
    });
});