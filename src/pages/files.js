import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { get } from 'lodash';

import { Link, Router } from '../routes';

import { postJson, getFilesData } from '../lib/fetch';
import { dependenciesStats } from '../lib/dependencies/utils';

import Header from '../components/Header';
import Upload from '../components/Upload';

import DependencyTable from '../components/DependencyTable';
import RecommendationList from '../components/RecommendationList';

export default class Files extends React.Component {
  static async getInitialProps({ req, query }) {
    const initialProps = {
      section: query.section,
    };

    // sessionFiles is optional and can be null (always on the client)
    const sessionFiles = get(req, 'session.files');
    const { files, dependencies, recommendations } = await getFilesData(
      sessionFiles,
    );

    return { ...initialProps, files, dependencies, recommendations };
  }

  static propTypes = {
    section: PropTypes.oneOf(['dependencies']),
    pathname: PropTypes.string,
    loggedInUser: PropTypes.object,
    files: PropTypes.object,
    dependencies: PropTypes.array,
    recommendations: PropTypes.array,
  };

  static defaultProps = {
    files: {},
    dependencies: [],
    recommendations: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      files: props.files,
      dependencies: props.dependencies,
      recommendations: props.recommendations,
      saving: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  refresh = async () => {
    const { files, dependencies, recommendations } = await getFilesData();

    if (Object.keys(files).length === 0) {
      Router.pushRoute('index');
    } else {
      this.setState({ files, dependencies, recommendations });
    }
  };

  handleRemoveFile = (id, event) => {
    event.stopPropagation();

    postJson('/files/delete', { id }).then(() => {
      this.refresh();
    });
  };

  renderFilesInfo(files) {
    return (
      <Fragment>
        <style jsx>
          {`
            .File {
              margin-bottom: 40px;
            }
            .File .name {
              font-size: 20px;
              line-height: 26px;
              color: #2e3033;
            }
            .File .dependencies {
              font-size: 16px;
              line-height: 24px;
              color: #6e747a;
              margin-top: 5px;
            }
            .File .actionButton {
              margin-top: 10px;
            }
            .actionButton {
              font-size: 14px;
              line-height: 18px;
              letter-spacing: -0.2px;
              color: #7448ff;
            }
            @media screen and (max-width: 500px) {
              .File {
                margin-top: 30px;
                margin-bottom: 20px;
              }
              .File .name {
                font-size: 16px;
                line-height: 26px;
                letter-spacing: -0.16px;
              }
              .File .dependencies {
                color: #6e747a;
                font-size: 14px;
                line-height: 24px;
                letter-spacing: -0.1625px;
              }
            }
          `}
        </style>
        {Object.entries(files).map(([id, file]) => (
          <div key={id} className="File">
            <div className="name">
              <strong>{file.projectName || 'Unnamed project'}</strong>
            </div>
            <div className="dependencies">
              {dependenciesStats(file).length} dependencies
            </div>
            <button
              className="actionButton"
              onClick={(e) => this.handleRemoveFile(id, e)}
            >
              X Remove file
            </button>
          </div>
        ))}
      </Fragment>
    );
  }

  render() {
    const { section, pathname, loggedInUser } = this.props;
    const { files, dependencies, recommendations } = this.state;
    const count = Object.keys(files).length;
    return (
      <div className="Page FilesPage">
        <style jsx global>
          {`
            .FilesPage {
              position: relative;
            }
          `}
        </style>

        <style jsx>
          {`
            .mobile-view,
            .mobile-file-info {
              display: none;
            }
            .contentWrapper {
              display: flex;
              margin: 20px 20px;
              padding: 10px 20px;
            }
            .sidebar {
              width: 20%;
              margin-right: 20px;
            }
            .main {
              width: 75%;
              margin-left: 20px;
            }
            .navigation-items {
              left: 350px;
            }
            @media screen and (max-width: 1024px) {
              .sidebar {
                width: 25%;
              }
              .main {
                width: 70%;
              }
              .navigation-items {
                left: 320px;
              }
            }
            @media screen and (max-width: 768px) {
              .contentWrapper {
                margin: 15px;
                padding: 10px 20px;
              }
              .sidebar {
                width: 30%;
                margin-right: 20px;
              }
              .main {
                width: 65%;
                margin-left: 20px;
              }
              .navigation-items {
                left: 285px;
              }
              .desktop-header {
                font-size: 24px;
                line-height: 28px;
                letter-spacing: -0.342857px;
              }
            }
            @media screen and (max-width: 500px) {
              .navigation {
                padding: 10px 20px;
                border-bottom: 1px solid #d5dae0;
              }
              .navigation h1 {
                text-align: left;
                font-size: 24px;
                line-height: 29px;
                letter-spacing: -0.4px;
                padding: 0;
              }
              .navigation p {
                color: #9399a3;
                margin: 10px 0;
                font-size: 12px;
                line-height: 11px;
                letter-spacing: 0.8px;
              }
              .mobile-view {
                display: block;
              }
              .desktop-view {
                display: none;
              }
              .File .name {
                color: #2e3033;
                font-size: 16px;
                line-height: 26px;
                letter-spacing: -0.16px;
              }
              .contentWrapper {
                margin: 20px 10px;
                padding: 0;
              }
              .main {
                width: 950%;
                margin: 5px;
              }
            }
          `}
        </style>

        <Header
          loggedInUser={loggedInUser}
          showHeaderActions={true}
          pathname={pathname}
        />

        <nav className="navigation">
          <h1 className="desktop-header">
            {count === 0 && 'No uploaded file'}
            {count === 1 && '1 file analyzed'}
            {count > 1 && `${count} files analyzed`}
          </h1>
          <p className="mobile-view">UPLOAD REPORT</p>
          <div className="mobile-view">{this.renderFilesInfo(files)}</div>
          <div className="navigation-items">
            <Link route="files">
              <a className={classNames({ active: !section })}>
                Projects requiring funding
              </a>
            </Link>
            <Link route="files" params={{ section: 'dependencies' }}>
              <a className={classNames({ active: section === 'dependencies' })}>
                Detected Dependencies
              </a>
            </Link>
          </div>
        </nav>
        <div className="contentWrapper">
          <div className="sidebar desktop-view">
            {this.renderFilesInfo(files)}
            <Upload
              onUpload={this.refresh}
              onUpdate={this.refresh}
              feedbackPosition="inside"
            />
          </div>

          <div className="main">
            {count === 0 && (
              <div className="error">
                <p>
                  Please upload at least one file to detect dependencies and
                  projects.
                </p>
              </div>
            )}
            {count > 0 && (
              <Fragment>
                {!section && (
                  <RecommendationList recommendations={recommendations} />
                )}

                {section === 'dependencies' && (
                  <DependencyTable dependencies={dependencies} />
                )}
              </Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
}
