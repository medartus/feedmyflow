const { admin } = require('../provider/firebase');

const LinkedinApi = require('./linkedinApi');

const db = admin.firestore();

const RetrieveOrganisationFromUser = async (userUid) =>{
    const linkedinApi = new LinkedinApi();
    await linkedinApi.retrieveAccessToken(userUid);

    const roleAssignee = await linkedinApi.request("LINKEDIN_API_ROLE_ASSIGNEE").catch((err)=>console.log(err));
    const orgs = roleAssignee.elements;
    console.log(orgs)
    const promises = orgs.map(async(org)=>{
        const params = {
            organizationID : org.organization.split(':').slice(-1)[0],
        }
        const orgInfos = await linkedinApi.request("LINKEDIN_API_ROLE_COMPANY_INFO",{params}).catch((err)=>console.log(err));
        const orgPhotos = await linkedinApi.request("LINKEDIN_API_COMPANY_PHOTO",{params}).catch((err)=>console.log(err));
        const { vanityName, localizedName } = orgInfos;
        const { identifier, mediaType } = orgPhotos.logoV2['cropped~'].elements[0].identifiers[0]
        return {...org,...{vanityName, localizedName, orgMedia:{url:identifier,mediaType} }}
    })
    return Promise.all(promises).then((orgArray)=>{
        return db.collection('user').doc(userUid).update({
            organizationList : orgArray,
        })
    })
}

const main = async () => {
    const userUid = "linkedin:3A8ySOLYhe";
    const orgInfos = await RetrieveOrganisationFromUser(userUid);
    console.log(orgInfos)
}

module.exports = { main };