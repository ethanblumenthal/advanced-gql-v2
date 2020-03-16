const {
  SchemaDirectiveVisitor,
  AuthenticationError
} = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const { formatDate } = require("./utils");

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { format } = this.args;

    field.resolve = async (...args) => {
      const result = await resolver.apply(this, args);
      return formatDate(result, format);
    };

    field.type = GraphQLString;
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.resolve = (root, args, ctx, info) => {
      if (!ctx.user) {
        throw new AuthenticationError("Not authorized");
      }
      return resolver(root, args, ctx, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { role } = this.args;

    field.resolve = (root, args, ctx, info) => {
      if (ctx.user.role !== role) {
        throw new AuthenticationError("Wrong role");
      }
      return resolver(root, args, ctx, info);
    };
  }
}

module.exports = {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective
};
