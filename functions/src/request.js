const fetch = require('node-fetch');

const get = async (accessToken, url) =>  {
    try {
        let response = await fetch(url, {
            method: "GET",
            headers: {
            "Authorization": "Bearer "+accessToken,
            }
        })

        if (response.status !== 200) throw new Error(response.message);
        
        const jsondata = await response.json();
        return jsondata;
    }
    catch (error) { 
        throw new Error(error) 
    } 
}

const post = (accessToken ,url, body, headers={}) =>  {
    return new Promise( async (resolve,reject) => {
        try {
            const authorization = { "Authorization": "Bearer "+accessToken}
            let response = await fetch(url, {
                method: "POST",
                headers: Object.assign({}, authorization, headers),
                body: JSON.stringify(body)
            })

            const jsondata = await response.json();
            
            if (response.status !== 200) reject(jsondata.message);
            resolve(jsondata);
        }
        catch (error) { 
            reject(error) 
        }    
    })
}

module.exports = { get, post };