import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import _ from 'lodash'

import TYPES from './DataTypes'
import '../css/DataSection.css'

import { Card, Progress, Button, Row, Col, Icon, Tag } from 'antd'
import GithubFetcher from '../scripts/GithubFetcher'

import Star from './sections/Star'

class DataSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      progress: new Map(),
      data: new Map(),
      stats: new Map(),
      visible: new Map(),
      ready: new Map(),
      loading: false,
    }

    const { githubApiToken } = this.props
    this.fetcher = new GithubFetcher(githubApiToken)
  }

  componentDidUpdate(prevProps) {
    const { deleteRepo, repos } = this.props
    const { data, stats, progress, visible, loading, ready } = this.state

    // delete repo out
    if (deleteRepo !== prevProps.deleteRepo && deleteRepo !== '') {
      data.delete(deleteRepo)
      stats.delete(deleteRepo)
      progress.delete(deleteRepo)
      ready.delete(deleteRepo)
      visible.delete(deleteRepo)
      this.setState({ data, stats, progress, ready, visible, loading: this._getAllProgress() !== 100 && loading && repos.length !== 0 })
    }

    // new repo in
    if (prevProps.repos !== repos && deleteRepo === '') {
      const newRepo = repos.filter(repo => !prevProps.repos.includes(repo))
      newRepo.forEach(repo => {
        data.set(repo, {})
        stats.set(repo, {})
        progress.set(repo, 0)
        ready.set(repo, false)
        visible.set(repo, true)
        this.setState({ data, stats, progress, ready, visible })
        if (loading) {
          this._fetch(repo)
        }
      })
    }
  }

  /**
   * fetching from a specific repository
   * for a specific data type from DataTypes.js
   * @param repo repo to fectch
   * @returns exit status string
   */
  _fetch = repo => {
    const { type, repos } = this.props
    const slashIndex = repo.indexOf('/')
    const owner = repo.slice(0, slashIndex)
    const name = repo.slice(slashIndex + 1)

    const onUpdate = data => {
      if(this.state.data.has(repo)) {
        this.state.data.set(repo, data)
        this.setState({ data: this.state.data })
      }
    }
    const onFinish = stats => {
      if(this.state.stats.has(repo)) {
        this.state.stats.set(repo, stats)
        this.state.ready.set(repo, true)
        this.setState({ stats: this.state.stats, ready: this.state.ready})
      }
      if (this._getAllProgress() === 100) {
        this.setState({ loading: false })
      }
    }
    const onProgress = progress => {
      if(this.state.progress.has(repo)) {
        this.state.progress.set(repo,progress)
        this.setState({
          progress:this.state.progress
        })
      }
    }
    const shouldAbort = () => {
      // if (this._getAllProgress() === 100) {
      //   this.setState({ loading: false })
      // }
      return !repos.includes(repo)
    }

    switch (type) {
      case TYPES.STAR:
        this.fetcher.fetchStargazerData(
          owner, name,
          onUpdate,
          onFinish,
          onProgress,
          shouldAbort,
        )
        break
      default:
        console.log('TYPE DOESNOT EXIST')
        return 'ERROR'
    }
    return 'FETCH REQUESTED'
  }

  /**
   * get progress of fetching all
   * @returns progress as number from 0 to 100
   */
  _getAllProgress = () => {
    const { progress } = this.state
    return Array.from(progress.values()).reduce((a, b) => a + b, 0)
    / (progress.size === 0 ? 1 : progress.size)
  }

  _renderUpdateAllButton = () => {
    const { loading, ready } = this.state
    const { repos } = this.props

    return (
      <Button
        icon="cloud-download"
        disabled={repos.length === 0}
        onClick={() => {
          this.setState({ loading: true })
          if (this._getAllProgress() === 100) { // re-fetch all
            repos.forEach(repo => this._fetch(repo))
          }
          else { // on fetch unfetched
            repos.forEach(repo => {
              if (!ready.get(repo)) {
                this._fetch(repo)
              }
            })
          }
        }}
        loading={loading}
      >
        Update
      </Button>
    )
  }

  _renderRepoTags = () => {
    const { progress, visible } = this.state
    const { repos } = this.props

    return (
      repos.map(repo => (
        <div key={"section-tag" + repo} style={{ display: 'inline-block'}}>
          <Progress
            type="circle"
            percent={progress.get(repo)}
            showInfo={false}
            strokeWidth={8}
            width={16}
          />
          <Tag
            className="repo-tag"
            checked={visible.get(repo)}
            onChange={checked => {
              visible.set(repo, checked)
              this.setState({ visible })
            }}
          >
            {repo}
          </Tag>
        </div>
      ))
    )
  }

  _renderBody = () => {
    const { data, stats, ready } = this.state
    const { type, repos} = this.props

    let body = <div />

    switch (type) {
      case TYPES.STAR:
        body = <Star repos={repos} data={data} stats={stats} ready={ready}/>
        break
      default:
        console.log('TYPE DOESNOT EXIST')
    }

    return body
  }

  render() {
    const { id } = this.props

    return (
      <div id={id}>
        <Row type="flex" align="middle">
          <div className="data-card">
            <Icon type="star" style={{ fontSize: '32px', color: '#ffb900' }} />
            <div className="section-title">
              Star
            </div>
          </div>
          <div className="data-card">
            {this._renderUpdateAllButton()}
          </div>
          <div className="data-card">
            {this._renderRepoTags()}
          </div>
          <Progress
            strokeWidth={1}
            width={32}
            percent={this._getAllProgress()}
            showInfo={false}
          />
        </Row>
        {this._renderBody()}
      </div>
    )
  }

}

DataSection.propTypes = {
  id: PropTypes.string,
  githubApiToken: PropTypes.string,
  repos: PropTypes.array,
  deleteRepo: PropTypes.string,
  type: PropTypes.string,
}

const mapStateToProps = state => ({
  githubApiToken: state.github.githubApiToken
})

export default connect(
  mapStateToProps,
)(DataSection)