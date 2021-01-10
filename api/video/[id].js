module.exports = (req, res) => {
    const { id } = req.params;
  
    res.send(`Hello ${id}!`)
  }
