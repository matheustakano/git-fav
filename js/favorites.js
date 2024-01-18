export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint).then(data => data.json()).then(({ login, name, public_repos, followers }) => ({
            login,
            name,
            public_repos,
            followers
        }))
    }
}

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()

        GithubUser.search('maykbrito').then(user => console.log(user))
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {

            const userExists = this.entries.find(entry => entry.login === username)
            
            if(userExists) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUser.search(username)
            
            if (user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries
        .filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.fav')
        addButton.onclick = (event) => {
            event.preventDefault()
            const { value } = this.root.querySelector('form input')

            this.add(value)
        }
    }

    update() {
        this.removeAllTr()

        
        this.entries.forEach( user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user a p').innerText = `${user.name}`
            row.querySelector('.user a span').innerText = `/${user.login}`
            row.querySelector('.repositories').innerText = `${user.public_repos}`
            row.querySelector('.followers').innerText = `${user.followers}`

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar esta linha?')
                if (isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
        }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
        <td class="user">
          <img src="https://github.com/diego3g.png" alt="" />
          <a target="_blank" href="https://github.com/diego3g">
            <p>Diego Fernandes</p>
            <span>/diego3g</span>
          </a>
        </td>
        <td class="repositories">69</td>
        <td class="followers">29400</td>
        <td>
          <button class="remove">Remover</button>
        </td>
        `

        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
            })
    }
}