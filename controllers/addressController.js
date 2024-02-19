const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

function verifyUserToken(userToken,res){
    
    // Extract the token from the authorization header
    const tokenParts = userToken.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }
    const token = tokenParts[1];
  
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    return decodedToken;
  
};

async function findUser(decodedToken,res) {
    try {
      const user = await User.findById(decodedToken.userId);  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
      return user;
    } catch (error) {
      throw error;
    }
};
  

const AddressController = {
  // Create a new address for the logged-in user
  async createAddress(req, res) {
    try {
      const { streetAddress, city, state, postalCode, country, phoneNumber, isDefault } = req.body;
      const userToken = req.headers.authorization;
      if (!userToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
      }    
  
      const decodedToken = verifyUserToken(userToken,res);
      if (!decodedToken) {
        return res.status(403).json({ error: 'Unauthorized access' });
      } 
  
      // Find the user by userId from the decoded token
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If the new address is set as default, find any existing default address
      if (isDefault) {
        const existingDefaultAddress = user.addresses.find(address => address.isDefault === true);
        if (existingDefaultAddress) {
          // Set the existing default address to false
          existingDefaultAddress.isDefault = false;
        }
      }
  
      const newAddress = {
        streetAddress,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
        isDefault
      };
  
      user.addresses.push(newAddress);
      await user.save();
  
      // Format the new address for response
      const formattedAddress = {
        id: newAddress._id,
        streetAddress: newAddress.streetAddress,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
        phoneNumber: newAddress.phoneNumber,
        isDefault: newAddress.isDefault
      };
  
      res.status(201).json({ message: 'Address created successfully', address: formattedAddress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  

  // Get all addresses of the logged-in user
  async getAllAddresses(req, res) {
    try {
      const userToken = req.headers.authorization;
      if (!userToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
      }    
  
      const decodedToken = verifyUserToken(userToken,res);
      if (!decodedToken) {
        return res.status(403).json({ error: 'Unauthorized access' });
      } 
      
      // Find the user by userId from the decoded token
      const user = await User.findById(decodedToken.userId).select('addresses');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Format the addresses response
      const formattedAddresses = user.addresses.map(address => ({
        id: address._id,
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phoneNumber: address.phoneNumber,
        isDefault: address.isDefault
      }));
  
      res.json({addresses: formattedAddresses});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  

  // Get a specific address of the logged-in user by addressId
  async getAddressById(req, res) {
    try {
      const addressId = req.params.addressId;
  
      const userToken = req.headers.authorization;
      if (!userToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
      }    
  
      const decodedToken = verifyUserToken(userToken,res);
      if (!decodedToken) {
        return res.status(403).json({ error: 'Unauthorized access' });
      } 
      
      // Find the user by userId from the decoded token
      const user = await User.findById(decodedToken.userId).select('addresses');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const address = user.addresses.find(addr => addr._id.toString() === addressId);
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
  
      // Format the address response
      const formattedAddress = {
        id: address._id,
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phoneNumber: address.phoneNumber,
        isDefault: address.isDefault
      };
  
      res.json({address:formattedAddress});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  

  // Update a specific address of the logged-in user by addressId
  async updateAddress(req, res) {
    try {
        const addressId = req.params.addressId;
        const { streetAddress, city, state, postalCode, country, phoneNumber, isDefault } = req.body;

        const userToken = req.headers.authorization;
        if (!userToken) {
            return res.status(401).json({ error: 'Authorization token is missing' });
        }

        const decodedToken = verifyUserToken(userToken, res);
        if (!decodedToken) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        // Find the user by userId from the decoded token
        const user = await User.findById(decodedToken.userId).select('addresses');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // Create an object to hold the updated address fields
        const updatedAddressFields = {};
        if (streetAddress) updatedAddressFields.streetAddress = streetAddress;
        if (city) updatedAddressFields.city = city;
        if (state) updatedAddressFields.state = state;
        if (postalCode) updatedAddressFields.postalCode = postalCode;
        if (country) updatedAddressFields.country = country;
        if (phoneNumber) updatedAddressFields.phoneNumber = phoneNumber;
        if (isDefault !== undefined) updatedAddressFields.isDefault = isDefault;

        // If the updated address is set as default, find any existing default address
        if (isDefault) {
            const existingDefaultAddress = user.addresses.find(address => address.isDefault === true);
            if (existingDefaultAddress) {
                // Set the existing default address to false
                existingDefaultAddress.isDefault = false;
            }
        }

        // Update the address with the provided fields
        Object.assign(user.addresses[addressIndex], updatedAddressFields);
        await user.save();

        // Format the response object
        const formattedAddress = {
            id: user.addresses[addressIndex]._id,
            streetAddress: user.addresses[addressIndex].streetAddress,
            city: user.addresses[addressIndex].city,
            state: user.addresses[addressIndex].state,
            postalCode: user.addresses[addressIndex].postalCode,
            country: user.addresses[addressIndex].country,
            phoneNumber: user.addresses[addressIndex].phoneNumber,
            isDefault: user.addresses[addressIndex].isDefault
        };

        res.json({ message: 'Address updated successfully', address: formattedAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
,



  // Delete a specific address of the logged-in user by addressId
  async deleteAddress(req, res) {
    try {
      
      const addressId = req.params.addressId;

      const userToken = req.headers.authorization;
      if (!userToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
      }    
  
      const decodedToken = verifyUserToken(userToken,res);
      if (!decodedToken) {
        return res.status(403).json({ error: 'Unauthorized access' });
      } 
      
      // Find the user by userId from the decoded token
      const user = await User.findById(decodedToken.userId).select('addresses');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
      if (addressIndex === -1) {
        return res.status(404).json({ error: 'Address not found' });
      }

      user.addresses.splice(addressIndex, 1);
      await user.save();

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AddressController;
