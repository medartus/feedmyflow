const { admin } = require('../provider/firebase');

const LinkedinApi = require('./linkedinApi');

const db = admin.firestore();

const RetrieveOrganisationFromUser = async (userUid, accessToken = undefined) =>{
    const linkedinApi = new LinkedinApi();
    
    if (accessToken) linkedinApi.setAccessToken(accessToken);
    else await linkedinApi.retrieveAccessToken(userUid);

    const roleAssignee = await linkedinApi.request("LINKEDIN_API_ROLE_ASSIGNEE").catch((err)=>console.log(err));
    if (roleAssignee === undefined){
        const userRef = db.collection('user').doc(userUid);
        const docSnapshot = await userRef.get();

        if (docSnapshot.exists) return userRef.update({organizationList : []})
        else return userRef.set({organizationList : []})
    }
    const orgs = roleAssignee.elements;

    const promises = orgs.map(async(org)=>{
        if(org.state !== 'APPROVED' || org.role !== "ADMINISTRATOR") return null;
        const params = {
            organizationID : org.organization.split(':').slice(-1)[0],
        }
        const orgInfos = await linkedinApi.request("LINKEDIN_API_ROLE_COMPANY_INFO",{params}).catch((err)=>console.log(err));
        const orgPhotos = await linkedinApi.request("LINKEDIN_API_COMPANY_PHOTO",{params}).catch((err)=>console.log(err));

        const { vanityName, localizedName } = orgInfos;

        let identifier = 'https://user-images.githubusercontent.com/45569127/112226711-ccf62600-8c2e-11eb-8f48-2d8c1b2d1b92.png';
        let mediaType = 'image/jpeg';

        if (orgPhotos.logoV2) {
            const identifiers = orgPhotos.logoV2['cropped~'].elements[0].identifiers[0];
            identifier = identifiers.identifier;
            mediaType = identifiers.mediaType;
        }
        
        return {...org,...{vanityName, localizedName, orgMedia:{url:identifier,mediaType} }};
    })
    return Promise.all(promises).then(async (orgArray)=>{
        const cleanedOrgArray = orgArray.filter(n => n);

        const userRef = db.collection('user').doc(userUid);
        const docSnapshot = await userRef.get();

        if (docSnapshot.exists) return userRef.update({organizationList : cleanedOrgArray})
        return userRef.set({organizationList : cleanedOrgArray})
    })
}

module.exports = { RetrieveOrganisationFromUser };