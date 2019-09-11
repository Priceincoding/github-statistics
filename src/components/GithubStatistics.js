import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import _ from 'lodash'

import TYPES from './DataTypes'
import COLORS from './sections/Colors'

import { Row, Col, Anchor, Button, Tag, Tooltip, message, Select } from 'antd'

import DataSection from './DataSection'

import GithubFetcher from '../scripts/GithubFetcher'

import { updateState } from '../actions'

// const CENTER_FLEX = { display: 'flex', placeContent: 'center' }
// const CENTER_LEFT_FLEX = { display: 'flex', justifyContent: 'flex-start', alignContent: 'center'}

// message.config({
//   top: 60,
//   duration: 2,
//   maxCount: 5,
// })

class GithubStatistics extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      repos:[],
      input: undefined,
      suggestions: [],
      testingRepo: false,
      deleteRepo: '',
    }

    this.fetcher = new GithubFetcher('05c1acf261f6b223411c73d8b71cb1a30ce9186a')

    this.props.updateState("githubApiToken", '05c1acf261f6b223411c73d8b71cb1a30ce9186a')

    this.search = _.debounce(
      this.fetcher.searchRepository,
      300,
      { leading: false, trailing: true }
    ).bind(this)
  }

  deleteRepo = index => {
    const { repos } = this.state
    const deleteRepo = repos[index]
    repos.splice(index,1)
    this.setState({
      repos: [...repos],
      deleteRepo: deleteRepo,
    })
  }

  addRepo = repo => {
    const { repos } = this.state
    if (repos.includes(repo)) {
      message.error(`${repo} is already added`)
    }
    else {
      this.setState({
        repos: [ ...repos, repo],
        deleteRepo: '',
      })
    }
  }

  // _handleAdding = repo => {
  //   const slashIndex = repo.indexOf('/')
  //   const owner = repo.slice(0, slashIndex)
  //   const name = repo.slice(slashIndex + 1)

  //   this.setState({ testingRepo: true })
  //   this.fetcher.testRepository(owner, name,
  //     result => {
  //       this.setState({ testingRepo: false })
  //       if (result) {
  //         this.addRepo(repo)
  //         message.success(repo + ' added')
  //       } else {
  //         message.error('Repository not found')
  //       }
  //     }
  //   )
  // }

  _renderTags = () => {
    const { repos } = this.state

    return (
      repos.map((repo, index) => (
        <Tag key={"tag" + repo} color={COLORS[index]} closable onClose={() => this.deleteRepo(index)}>
          {repo}
        </Tag>
      ))
    )
  }

  _renderHeaderInput = () => {
    const { repos, input, testingRepo, suggestions } = this.state

    // const format = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/{1}[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

    let hintMessage = ''

    // Conditions
    const inputEmpty = input === undefined
    // const formatIncorrect = !format.test(input)
    const repoExisted = repos.includes(input)

    if (repoExisted) hintMessage = 'Repository already added'
    // if (formatIncorrect) hintMessage = 'Input incorrectly formatted'
    if (inputEmpty) hintMessage = 'Empty'

    const disabled = inputEmpty || repoExisted

    return (
      <React.Fragment>
        {/* <Input
          className="header-input"
          prefix={<Icon type="github"/>}
          placeholder="owner/name"
          value={input}
          onChange={e => {
            this.setState({ input: e.target.value })
            this.fetcher.searchRepository(e.target.value, suggestions => this.setState({ suggestions }))
          }}
          onPressEnter={() => !disabled && this._handleAdding(input)}
          disabled={testingRepo}
          allowClear
        /> */}
        <Select
          className="header-input"
          value={input}
          placeholder="search by repository"
          defaultActiveFirstOption={false}
          onChange={input => {
            this.setState({ input })
            this.addRepo(input)
          }}
          onSearch={input => this.search(input, suggestions => this.setState({ suggestions }))}
          notFoundContent={null}
          showArrow={false}
          filterOption={false}
          showSearch
        >
          {suggestions.map(repo => (
            <Select.Option key={`suggestion-${repo}`} value={repo}>{repo}</Select.Option>
          ))}
        </Select>
        <Tooltip
          title={hintMessage}
        >
          <Button
            icon="plus"
            type="primary"
            loading={testingRepo}
            disabled={disabled}
            onClick={() => this.addRepo(input)}
          />
        </Tooltip>
      </React.Fragment>
    )
  }

  render() {
    // const dotStyle = {strokeWidth: 2, r: 2.5}
    const { repos, deleteRepo } = this.state

    return (
      <div>
        <header>
          <div className="header">
            <Row type="flex" align="middle">
              <Col className="header-section">
                <a className="header-title" href="/">
                  Github Stats
                </a>
              </Col>
              <Col className="header-section flex-center">
                {this._renderHeaderInput()}
              </Col>
              <Col className="header-section flex-center-left">
                {this._renderTags()}
              </Col>
            </Row>
          </div>
        </header>
        <div className="container">
          <div className="sider">
            <Anchor bounds={0} className="anchor">
              {Object.values(TYPES).map(value => (
                <Anchor.Link key={`anchor-link-${value}`} title={value} href={`#${value}`}/>
              ))}
            </Anchor>
          </div>

          <div className="content" >
            <DataSection
              type={TYPES.REPO}
              repos={repos}
              deleteRepo={deleteRepo}
            />

            <DataSection
              type={TYPES.STAR}
              repos={repos}
              deleteRepo={deleteRepo}
            />

            <DataSection
              type={TYPES.FORK}
              repos={repos}
              deleteRepo={deleteRepo}
            />

            <DataSection
              type={TYPES.RELEASE}
              repos={repos}
              deleteRepo={deleteRepo}
            />
          </div>
        </div>
      </div>
    )
  }
}

GithubStatistics.propTypes = {
  updateState: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
  updateState: (state, data) => dispatch(updateState(state, data)),
})

export default connect(
  null,
  mapDispatchToProps,
)(GithubStatistics)