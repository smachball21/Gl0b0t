# Gl0b0t


Get the bot
```
git clone https://github.com/smachball21/Gl0b0t.git
```

Install Packages
```
npm install
```

Configure config.json
```
token = Your bot token
adminID = Identifiant of your discord user
clientID = Your bot client ID
giphyAPIkey = Your API key of giphy (for the *randomgif)
```

Run the bot
```
node index.js
```

Bug Fixes:

If u are this error when u type - *help :
```
TypeError: fields.flat is not a function
```

Modify in nodes_modules > discord.js > src > structures

MessageEmbed.js

Replace this :
```
  static normalizeFields(...fields) {
    return fields
      .flat(2)
      .map(field =>
        this.normalizeField(
          field && field.name,
          field && field.value,
          field && typeof field.inline === 'boolean' ? field.inline : false,
        ),
      );
  }
```

to

```
  static normalizeFields(...fields) {
    return fields
      .reduce((acc, val) => acc.concat(val), [])
      .map(field =>
        this.normalizeField(
          field && field.name,
          field && field.value,
          field && typeof field.inline === 'boolean' ? field.inline : false,
        ),
      );
  }
```
